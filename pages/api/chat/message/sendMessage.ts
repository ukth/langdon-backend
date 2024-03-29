import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType, sendMessagePush } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    user,
  }: {
    user: User;
  }
) {
  const {
    chatroomId,
    content,
  }: {
    chatroomId?: number;
    content?: string;
  } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const chatroom = await client.chatroom.findUnique({
    where: {
      id: chatroomId,
    },
    include: {
      members: {
        select: { id: true, pushToken: true },
      },
    },
  });

  if (!chatroom) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.chatroom.chatroomNotFound });
  }

  if (!chatroom.members.map((member) => member.id).includes(user.id)) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.chatroom.notMember });
  }

  if (chatroom.members.length !== 2) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.chatroom.membersNotTwo });
  }

  const targetUser =
    chatroom.members[chatroom.members[0].id === user.id ? 1 : 0];

  const message = await client.message.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      chatroom: {
        connect: {
          id: chatroom.id,
        },
      },
      lastChatroom: {
        connect: {
          id: chatroom.id,
        },
      },
      content,
    },
  });

  await sendMessagePush(targetUser.pushToken, content);

  return res.json({
    ok: true,
    chatroom: handleDates(chatroom),
  });
}

export default withHandler({ methods: ["POST"], handler });
