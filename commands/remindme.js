const Reminder = require("../models/reminder").Reminder;

const getTimeToRemind = (timeInput = "5") => {
  let unitName,
    ms,
    unit = parseInt(timeInput);
  switch (timeInput[timeInput.length - 1]) {
    case "h":
      unitName = "hour(s)";
      ms = unit * 60 * 60 * 1000;
      break;
    case "s":
      unitName = "second(s)";
      ms = unit * 1000;
      break;
    case "m":
    default:
      unitName = "minute(s)";
      ms = unit * 60 * 1000;
  }
  return { unitName, ms, unit };
};

module.exports = {
  name: "remindme",
  description: "Remind me in x time. e.g: remindme send email 3m",
  execute(message, args, { Discord }) {
    const remindText = args.slice(0, -1).join(" ").toString();
    const inputTime = args.length > 1 ? args[args.length - 1] : "5";
    const remindTime = getTimeToRemind(inputTime);

    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const randomEndText = endTxt[Math.floor(Math.random() * endTxt.length)];
    const randomStrText = strTxt[Math.floor(Math.random() * strTxt.length)];

    const createEmbedMsg = (title, msg) =>
      new Discord.MessageEmbed()
        .setColor(`#${randomColor}`)
        .setTitle(title)
        .setDescription(msg);

    const remindStart = createEmbedMsg(
      "Reminder setted",
      `I'll remind you in ${remindTime.unit} ${remindTime.unitName}.`
    );

    const remindEndMsg = createEmbedMsg(
      `Reminder: ${remindText}`,
      `${remindTime.unit} ${remindTime.unitName} ago.`
    );

    message.channel.send(remindStart);

    const schedule_date = new Date();
    schedule_date.setSeconds(
      schedule_date.getSeconds() + Math.floor(remindTime.ms / 1000)
    );

    const reminder = new Reminder({
      name: message.author.username,
      owner_id: message.author.id,
      room_id: message.channel.id,
      schedule_date: schedule_date,
      guild_id: message.guild.id,
      title: `Reminder: ${remindText}`,
      message: `${remindTime.unit} ${remindTime.unitName} ago.`,
      sended: false,
    });

    reminder.save(errorOnSave);

    setTimeout(() => {
      message.channel.send(`Reminder for ${message.author}`);
      message.channel.send(remindEndMsg);

      reminder.sended = true;
      reminder.save(errorOnSave);
    }, remindTime.ms);
  },
};

function errorOnSave(err) {
  if (err) {
    console.log(`${message.author} Error saving reminder :/`, { err });
  }
}
