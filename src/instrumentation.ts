import {initORM, liquibase} from "@/shared/serverutils";
import "reflect-metadata"

export async function register() {
  liquibase.update({})
      .catch(reason => {
        console.log("Liquibase failed: ", reason);
        process.exit(1);
      })
      .then(() => initORM())
      .catch(reason => {
        console.log("TypeORM failed: ", reason);
        process.exit(1);
      })
}