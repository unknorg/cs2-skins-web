import {liquibase} from "@/shared/serverutils";

export async function register() {
  liquibase.update({})
      .catch(reason => {
        console.log("Cannot recover from exception: ", reason);
        process.exit(1);
      })
}