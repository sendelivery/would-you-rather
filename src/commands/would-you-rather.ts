import { getInteractor, getQuestionById, incrementVote } from "../database";
import { WouldYouRatherTypes } from "../types";
import state from "../state/state";
import questionEmbed from "../embeds/question";
import {
  CommandInteraction,
  Interaction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ActivityTypes } from "discord.js/typings/enums";
import { PrismaClient } from "@prisma/client";
import { partition } from "lodash";
import { green, yellow } from "chalk";

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

  const answers = await prisma.answer.findMany({
    where: {
      questionId: question.id,
    },
  });

  console.log(answers);

  const answer0 = answers.filter(({ first }) => first)[0];
  const answer1 = answers.filter(({ first }) => !first)[0];

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(answer0.id.toString())
        .setLabel(answer0.text)
        .setStyle("PRIMARY")
    )
    .addComponents(
      new MessageButton()
        .setCustomId(answer1.id.toString())
        .setLabel(answer1.text)
        .setStyle("SUCCESS")
    );

  await commandInteraction.reply({
    embeds: [await questionEmbed(question)],
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
    name: `WYR, with ${t.toString()} seconds left!`,
    type: ActivityTypes.PLAYING,
  });
  const interval = setInterval(() => {
    t -= 5;
    commandInteraction.client.user?.setActivity({
      name: `WYR, with ${t.toString()} seconds left!`,
      type: ActivityTypes.PLAYING,
    });
  }, 5000);

  collector.on("collect", async (buttonInteraction) => {
    await prisma.vote.upsert({
      where: { id: `${buttonInteraction.user.id}-${qInteraction.id}` },
      create: {
        id: `${buttonInteraction.user.id}-${qInteraction.id}`,
        answerId: parseInt(buttonInteraction.customId),
        interactionId: qInteraction.id,
      },
      update: {},
    });

    const votedAnswer = await prisma.answer.findUnique({
      where: { id: parseInt(buttonInteraction.customId) },
    });

    await buttonInteraction.reply({
      content: `You voted for ${votedAnswer?.text}.`,
      ephemeral: true,
    });
  });

  collector.on("end", async (collected) => {
    console.log(`Collected ${collected.size} items`);
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

    const votes = await prisma.vote.findMany({
      where: { interactionId: qInteraction.id },
    });

    const [votes0, votes1] = partition(
      votes,
      (el) => el.answerId === votes[0].answerId
    );

    console.log("Votes0", votes0);
    console.log("Votes1", votes1);

    if (votes0.length === votes1.length) {
      await commandInteraction.editReply({
        components: [],
      });

      const tieTuples = await prisma.answer.findMany({
        where: {
          OR: [
            {
              id: votes0[0].answerId,
            },
            {
              id: votes1[0].answerId,
            },
          ],
        },
      });

      await commandInteraction.followUp(
        `...And it's a tie! Between **${tieTuples[0].text}** and **${
          tieTuples[1].text
        }** with ${votes0.length} vote${votes0.length > 1 ? "s" : ""} each!`
      );

      return;
    }

    const winner = votes0.length > votes1.length ? votes0 : votes1;

    const winnerTuple = await prisma.answer.findUnique({
      where: {
        id: winner[0].answerId,
      },
    });

    console.log("WINNER: ", winnerTuple);

    const text = winnerTuple?.text;

    // Remove buttons to vote after timer ends.
    await commandInteraction.editReply({
      components: [],
    });

    await commandInteraction.followUp(
      `...And the winner is... **${text}** with **${winner.length}** votes!`
    );

    state.setActive(false);
  });
};
