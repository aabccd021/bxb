import { NextPage } from "next";
import React from "react";
import { useThreadCreation } from "../../generated";
import {
  Created,
  Creating,
  Error,
  Initial,
  NotCreated,
} from "../../page-components/thread/new";

const Page: NextPage = () => {
  const creation = useThreadCreation();
  return (
    <>
      {creation.state === "created" && <Created creation={creation} />}
      {creation.state === "creating" && <Creating creation={creation} />}
      {creation.state === "error" && <Error creation={creation} />}
      {creation.state === "initial" && <Initial creation={creation} />}
      {creation.state === "notCreated" && <NotCreated creation={creation} />}
    </>
  );
};

export default Page;
