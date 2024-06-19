// the server to ping the pingee

const axios = require("axios");
const { constants } = require("buffer");
const dotenv = require("dotenv").config();
const discord = require("discord.js");

const ip = process.env.PINGEE_ID;
const port = process.env.PINGEE_PORT;

let webhook = new discord.WebhookClient({
  id: process.env.DISCORD_WEBHOOK_ID,
  token: process.env.DISCORD_WEBHOOK_TOKEN,
});

let last_check_good = false; // always assume that the last check was bad

function send_down_notification(code, data) {
  let currentTime = new Date();
  let chicagoTime = currentTime.toLocaleString("en-US");
  let utcTime = currentTime.toUTCString();
  let embed = new discord.EmbedBuilder()
    .setTitle("Internet outage detected")
    .addFields(
      { name: "Response code", value: `${code}`, inline: false },
      { name: "Response data", value: `${data}`, inline: false },
      {
        name: "Time (America/Chicago)",
        value: `${chicagoTime}`,
        inline: false,
      },
      { name: "Time (UTC)", value: `${utcTime}`, inline: false }
    )
    .setTimestamp();

  webhook.send({
    content: "<@1191850547138007132>",
    embeds: [embed],
  });
}

function send_up_notification(code, data) {
  let currentTime = new Date();
  let chicagoTime = currentTime.toLocaleString("en-US");
  let utcTime = currentTime.toUTCString();
  let embed = new discord.EmbedBuilder()
    .setTitle("Internet outage resolved")
    .addFields(
      { name: "Response code", value: `${code}`, inline: false },
      { name: "Response data", value: `${data}`, inline: false },
      {
        name: "Time (America/Chicago)",
        value: `${chicagoTime}`,
        inline: false,
      },
      { name: "Time (UTC)", value: `${utcTime}`, inline: false }
    )
    .setTimestamp();

  webhook.send({
    content: "<@1191850547138007132>",
    embeds: [embed],
  });
}

setInterval(function () {
  axios
    .get(`http://${ip}:${port}/check-status`)
    .then(function (response) {
      console.log(response.data);
      if (response.data == "yup i am working :)") {
        console.log("Got a normal response!");
        last_check_good = true;
        if (!last_check_good) {
          send_up_notification(response.code, response.data);
        }
      } else {
        if (last_check_good) {
          console.log(
            "Got an abnormal response... Sending down notification..."
          );
          send_down_notification(response.code, response.data);
          last_check_good = false;
        }
      }
    })
    .catch(function (error) {
      if (last_check_good) {
        console.log("Received error... Sending down notification...");
        send_down_notification(error.code, error.data);
        last_check_good = false;
      }
    });
}, 60 * 1000);
