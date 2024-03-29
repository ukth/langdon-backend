import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    collegeId,
  }: {
    collegeId: number;
  }
) {
  if (!collegeId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.loginRequired });
  }

  const boards = await client.board.findMany({
    where: {
      collegeId,
      type: "general",
    },

    orderBy: {
      id: "asc",
    },
    take: 30,
  });

  return res.json({
    ok: true,
    boards: handleDates(boards),
  });
}

export default withHandler({ methods: ["POST"], handler });
