import type {NextApiRequest, NextApiResponse} from 'next'
import {constants} from "http2";
import {initORM} from "@/shared/serverutils";
import {Account} from "@/shared/entities";

const VALID_SECONDS = 60;
let lastFetchTimestamp = 0;


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
  if (lastFetchTimestamp + VALID_SECONDS * 1000 > Date.now()) {
    res.status(200).send("");
    return;
  }

  initORM()
      .then(datasource => datasource.getRepository(Account))
      .then(repository => repository.count())
      .then(() => {
            lastFetchTimestamp = Date.now();
            res.status(200).send("");
          }
      )
      .catch(() => res
          .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send(""))
}