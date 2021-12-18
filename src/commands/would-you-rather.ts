import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";
import state from "../state/state";
import { yellow } from "chalk";
import { commands } from "..";
import { ActivityTypes } from "discord.js/typings/enums";
import { getInteractor, getQuestionById, incrementVote } from "../database";

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

export const execute = async (commandInteraction: CommandInteraction) => {
  if (state.getActive()) {
    await commandInteraction.reply({
      content:
        "Hey, a would you rather question is already active above! Aren't you paying attention?",
      ephemeral: true,
    });

    return;
  }

  state.setActive(true);

  let timer;
  if (commandInteraction.options.getString("time", false)) {
    timer = Number(commandInteraction.options.getString("time", false));
  }

  // Make sure the timer isn't nonsense and is between 5 and 120 seconds basically.
  if ((timer && timer !== NaN) || (timer && timer !== 0)) {
    timer = Math.min(Math.max(timer, 5), 120);
  } else {
    timer = 60;
  }

  const count = await prisma.question.count();
  const id = Math.floor(Math.random() * count) + 1;

  // Retrieve a random question
  const question = await getQuestionById(id);

  if (!question) {
    return await commandInteraction.reply(
      `Could not find question of matching id ${id}.`
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

  const qInteraction = await prisma.interaction.upsert({
    where: {
      commandId: commandInteraction.id,
    },
    update: {},
    create: {
      commandId: commandInteraction.id,
      questionId: question.id,
    },
  });

  await commandInteraction.reply({
    content: `Would you rather ${question.message}?`,
    components: [row],
  });

  if (!commandInteraction.channel) return;
  const collector = commandInteraction.channel.createMessageComponentCollector({
    componentType: "BUTTON",
    time: timer * 1000,
  });

  // Set bot status message
  let t: number = timer;
  commandInteraction.client.user?.setActivity({
    name: `${t.toString()} seconds left!`,
    type: ActivityTypes.PLAYING,
  });
  const interval = setInterval(() => {
    t -= 5;
    commandInteraction.client.user?.setActivity({
      name: `${t.toString()} seconds left!`,
      type: ActivityTypes.PLAYING,
    });
  }, 5000);

  collector.on("collect", async (buttonInteraction) => {
    // First we check if this interactor has already cast a vote for this interaction.
    const interactor = await getInteractor(commandInteraction.id, buttonInteraction.user.id);

    console.log("user: ", interactor);
    // If so then we swap the vote, otherwise continue the normal flow.
    // TODO: Interacting with the same button twice will cast two votes for one answer and put the other in the negatives.
    if (interactor[0] && interactor[0].userId) {
      console.log(yellow(`${interactor} already voted, changing vote.`));

      if (buttonInteraction.customId === "ans0") {
        await incrementVote(
          buttonInteraction,
          {
            votes0: { increment: 1 },
            votes1: { increment: -1 },
          },
          qInteraction.id
        );

        await buttonInteraction.reply({
          content: `You changed your vote to ${question.answer0}`,
          ephemeral: true,
        });
      }
      if (buttonInteraction.customId === "ans1") {
        await incrementVote(
          buttonInteraction,
          {
            votes0: { increment: -1 },
            votes1: { increment: 1 },
          },
          qInteraction.id
        );

        await buttonInteraction.reply({
          content: `You changed your vote to ${question.answer1}`,
          ephemeral: true,
        });
      }
    } else {
      if (buttonInteraction.customId === "ans0") {
        await incrementVote(
          buttonInteraction,
          {
            votes0: { increment: 1 },
          },
          qInteraction.id
        );

        await buttonInteraction.reply({
          content: `You voted for ${question.answer0}`,
          ephemeral: true,
        });
      }
      if (buttonInteraction.customId === "ans1") {
        await incrementVote(
          buttonInteraction,
          {
            votes1: { increment: 1 },
          },
          qInteraction.id
        );

        await buttonInteraction.reply({
          content: `You voted for ${question.answer1}`,
          ephemeral: true,
        });
      }
    }
  });

  collector.on("end", async (collected) => {
    console.log(`Collected ${collected.toJSON()} items`);
    clearInterval(interval);
    commandInteraction.client.user?.setStatus("online");
    commandInteraction.client.user?.setActivity({
      name: "results!",
      type: ActivityTypes.WATCHING,
    });

    setTimeout(() => {
      commandInteraction.client.user?.setActivity("");
    }, 5000);

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

    await commandInteraction.editReply({
      components: [],
    });

    await commandInteraction.followUp(
      `...And the winner is... **${winner}** with **${wVotes}** votes!`
    );

    state.setActive(false);
  });
};
