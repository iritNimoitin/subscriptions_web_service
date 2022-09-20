import jwt from "jsonwebtoken";
import config from "../source/config/config";
import { User } from "../entites/user";

const signJWT = (
  user: User,
  callback: (error: Error | null, token: string | null) => void
): void => {
  const timeSinceEpoch = new Date().getTime();
  const expirationTime =
    timeSinceEpoch + Number(config.server.token.expireTime) * 100000;
  const expirationTimeInSeconds = Math.floor(expirationTime / 1000);

  try {
    jwt.sign(
      {
        username: user.userName,
      },
      config.server.token.secret,
      {
        issuer: config.server.token.issuer,
        algorithm: "HS256",
        expiresIn: expirationTimeInSeconds,
      },
      (error, token) => {
        if (error) {
          callback(error, null);
        } else if (token) {
          callback(null, token);
        }
      }
    );
  } catch (error) {
    throw error;
  }
};

export default signJWT;
