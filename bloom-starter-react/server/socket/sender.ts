import * as redis from "redis";

const pub = redis.createClient(process.env.REDIS_URL || "");

type SocketMessage = {
  userId: string;
  type: string;
  payload: string;
};

const sendSocketMessage = async (socketMessage: SocketMessage) => {
  console.log(`Sending Message: ${JSON.stringify(socketMessage)}`);
  pub.publish("socket", JSON.stringify(socketMessage));
};

export { sendSocketMessage };
