import {
  Channel,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
import { SlashCommandBuilder, time } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const data = new SlashCommandBuilder()
  .setName("wyr")
  .setDescription("Selects a question from Would You Rather's database!")
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription(
        "Set a timer in seconds e.g. '15'. Default is 60 seconds. Min is 5 seconds, max is 120 seconds."
      )
      .setRequired(false)
  );

export const execute = async (interaction: CommandInteraction) => {
  let timer;
  if (interaction.options.getString("time", false)) {
    timer = Number(interaction.options.getString("time", false));
  }

  if ((timer && timer !== NaN) || (timer && timer !== 0)) {
    console.log(1);
    timer = Math.min(Math.max(timer, 5), 120);
  } else {
    console.log(2);
    timer = 60;
  }

  // TODO: if current active wyr, i.e. interaction { active: true } => return ephemeral "wyr in progress"
  // TODO: active: false on timeout
  const currentInteraction = interaction;
  const count = await prisma.question.count();

  const question = await prisma.question.findUnique({
    where: {
      id: Math.floor(Math.random() * count) + 1,
    },
  });

  if (!question) {
    return await currentInteraction.reply(
      `Could not find question of matching id ${count}.`
    );
  }

  // TODO: clicking a button again should change the vote
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

  const qInteraction = await prisma.interaction.upsert({
    where: {
      commandId: currentInteraction.id,
    },
    update: {},
    create: {
      commandId: currentInteraction.id,
      questionId: question.id,
    },
  });

  await currentInteraction.reply({
    content: `Would you rather ${question.message}?`,
    components: [row],
  });

  if (!currentInteraction.channel) return;
  const collector = currentInteraction.channel.createMessageComponentCollector({
    componentType: "BUTTON",
    time: timer * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "ans0") {
      await incrementVote(
        interaction,
        {
          votes0: { increment: 1 },
        },
        qInteraction.id
      );

      await interaction.reply({
        content: `You voted for ${question.answer0}`,
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
        content: `You voted for ${question.answer1}`,
        ephemeral: true,
      });
    }
  });

  collector.on("end", async (collected) => {
    console.log(`Collected ${collected.toJSON()} items`);

    const q = await prisma.interaction.findUnique({
      where: {
        id: qInteraction.id,
      },
    });

    if (!q) return;

    const votes0 = q.votes0;
    const votes1 = q.votes1;

    const [winner, wVotes] =
      votes0 > votes1 ? [question.answer0, votes0] : [question.answer1, votes1];

    currentInteraction.editReply({
      components: [],
    });

    // const channelId = interaction.channelId;
    // const channel: any = interaction.client.channels.cache.get(channelId); // Why am I using any

    // if (!channel) { console.log("Uh oh"); return; }

    // channel.send(`...And the winner is... **${winner}** with **${wVotes}** votes!`);

    await currentInteraction.followUp(
      `...And the winner is... **${winner}** with **${wVotes}** votes!`
    );
  });
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
