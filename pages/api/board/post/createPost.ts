import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  errorMessages,
  MIN_CONTENT_LENGTH,
  MIN_TITLE_LENGTH,
} from "@constants";
import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    user,
    collegeId,
  }: {
    user: User;
    collegeId: number;
  }
) {
  const {
    boardId,
    title,
    content,
    isAnonymous = true,
  }: {
    boardId?: number;
    title?: string;
    content?: string;
    isAnonymous?: boolean;
  } = req.body;

  if (!boardId || !title?.length || !content?.length) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.paramsNotEnough });
  }

  // if (!boardId || !validBoard(collegeId, boardId)) {
  //   return res
  //     .status(400)
  //     .json({ ok: false, error: errorMessages.post.getPostInvalidBoard });
  // }

  const post = await client.post.create({
    data: {
      createdBy: {
        connect: {
          id: user.id,
        },
      },
      title,
      content,
      isAnonymous,
      board: {
        connect: {
          id: boardId,
        },
      },
    },
  });

  if (!post) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.postNotCreated });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
