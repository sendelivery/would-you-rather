import { Question } from ".prisma/client";
import { MessageEmbed } from "discord.js";
import { client } from "..";

const questionEmbed = async (question: Question) => {
  let user;
  try {
    user = await client.users.fetch(question.author);
  } catch {}

  return new MessageEmbed()
    .setDescription(`Would you rather ${question.message}?`)
    .setFooter(
      `Added by ${user?.username || question.author}`,
      user?.avatarURL() || ""
    );
};

export default questionEmbed;
