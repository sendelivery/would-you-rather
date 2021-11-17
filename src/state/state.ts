import { blue } from "chalk";

const applicationState = {
  active: false,
};

export default {
  setActive(b: boolean) {
    applicationState.active = b;
    console.log(blue(`applicationState.active set to ${b}`));
  },
  getActive() {
    return applicationState.active;
  },
};
