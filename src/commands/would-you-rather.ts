import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const data = new SlashCommandBuilder()
  .setName("wyr")
  .setDescription("Selects a question from Would You Rather's database!");

export const execute = async (interaction: CommandInteraction) => {
  // TODO: if current active wyr, i.e. interaction { active: true } => return ephemeral "wyr in progress"
  // TODO: active: false on timeout

  const count = await prisma.question.count();

  const question = await prisma.question.findUnique({
    where: {
      id: Math.floor(Math.random() * count) + 1,
    },
  });

  if (!question) {
    return await interaction.reply(
      `Could not find question of matching id ${count}.`
    );
  }

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId("ans0")
        .setLabel(question.answer0)
        .setStyle("PRIMARY")
    )
    .addComponents(
      new MessageButton()
        .setCustomId("ans1")
        .setLabel(question.answer1)
        .setStyle("SUCCESS")
    );

  console.log(interaction);

  const qInteraction = await prisma.interaction.upsert({
    where: {
      commandId: interaction.id,
    },
    update: {},
    create: {
      commandId: interaction.id,
      questionId: question.id,
    },
  });

  await interaction.reply({
    content: `Would you rather ${question.message}?`,
    components: [row],
  });

  if (!interaction.channel) return;
  const collector = interaction.channel.createMessageComponentCollector({
    componentType: "BUTTON",
    time: 10000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "ans0") {
      const interactor = await prisma.interactor.upsert({
        where: {
          userId: interaction.user.id,
        },
        update: {},
        create: {
          userId: interaction.user.id,
        },
      });

      await incrementVote(
        interaction,
        {
          votes1: { increment: 1 },
        },
        qInteraction.id
      );

      await interaction.reply({
        content: "Vote submitted!0",
        ephemeral: true,
      });
    }
    if (interaction.customId === "ans1") {
      await incrementVote(
        interaction,
        {
          votes1: { increment: 1 },
        },
        qInteraction.id
      );

      await interaction.reply({
        content: "Vote submitted!1",
        ephemeral: true,
      });
    }
  });

  collector.on("end", (collected) =>
    console.log(`Collected ${collected.toJSON()} items`)
  );
};

interface IVotes0 {
  votes0: {
    increment: number;
  };
}

interface IVotes1 {
  votes1: {
    increment: number;
  };
}

const incrementVote = async (
  interaction: MessageComponentInteraction,
  votes: IVotes0 | IVotes1,
  id: number
) => {
  return await prisma.interaction.update({
    where: {
      id: id,
    },
    data: {
      ...votes,
      interactors: {
        connectOrCreate: {
          where: {
            userId: interaction.user.id,
          },
          create: {
            userId: interaction.user.id,
          },
        },
      },
    },
  });
};
