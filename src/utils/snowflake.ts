import { Snowflake } from "nodejs-snowflake";

const uid = new Snowflake({
  custom_epoch: new Date("2024-04-07").getTime(),
});

export default uid;
