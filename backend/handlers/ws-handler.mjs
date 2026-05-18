import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "SquadRooms";

export const handler = async (event) => {
  const { connectionId, routeKey, domainName, stage } = event.requestContext;
  const endpoint = `https://${domainName}/${stage}`;
  
  try {
    switch (routeKey) {
      case '$connect':
        // Just accept the connection. We register them to a room in 'joinRoom'
        return { statusCode: 200, body: 'Connected.' };
        
      case '$disconnect':
        // Advanced Cleanup: If they disconnect, find their RoomID (requires a GSI in full prod, 
        // but for the hackathon, we can rely on frontend leaving cleanly or expiring old sessions)
        return { statusCode: 200, body: 'Disconnected.' };

      case '$default':
        const body = JSON.parse(event.body);
        const apigwManagementApi = new ApiGatewayManagementApiClient({ endpoint });

        if (body.action === 'joinRoom') {
          // 1. Register player to the room
          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              RoomID: body.roomId,
              ConnectionID: connectionId,
              Username: body.username,
              Score: 0,
              Timestamp: Date.now()
            }
          }));
          await broadcastRoomSync(body.roomId, apigwManagementApi);
        } 
        
        else if (body.action === 'syncBoard') {
          // 2. Update player's score
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { RoomID: body.roomId, ConnectionID: connectionId },
            UpdateExpression: "set Score = :s",
            ExpressionAttributeValues: { ":s": body.score }
          }));
          // 3. Broadcast new leaderboard to everyone
          await broadcastRoomSync(body.roomId, apigwManagementApi);
        }
        return { statusCode: 200, body: 'Action processed.' };
    }
  } catch (err) {
    console.error("Socket Error:", err);
    return { statusCode: 500, body: 'Internal Error' };
  }
};

// Helper: Fetch all users in a room and push the updated leaderboard
async function broadcastRoomSync(roomId, apigw) {
  const data = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "RoomID = :r",
    ExpressionAttributeValues: { ":r": roomId }
  }));

  // Sort by score descending for the leaderboard
  const players = data.Items
    .map(item => ({ username: item.Username, score: item.Score, connectionId: item.ConnectionID }))
    .sort((a, b) => b.score - a.score);
  
  // Push to all active connections
  const postCalls = data.Items.map(async ({ ConnectionID }) => {
    try {
      await apigw.send(new PostToConnectionCommand({
        ConnectionId: ConnectionID,
        Data: JSON.stringify({ type: 'ROOM_SYNC', payload: { players } })
      }));
    } catch (e) {
      if (e.$metadata && e.$metadata.httpStatusCode === 410) {
        // TIGHT ENGINEERING: If connection is stale (user closed tab), delete them from the database
        console.log(`Found stale connection, deleting ${ConnectionID}`);
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { RoomID: roomId, ConnectionID }
        }));
      }
    }
  });
  
  await Promise.all(postCalls);
}