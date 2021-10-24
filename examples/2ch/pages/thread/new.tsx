import { NextPage } from "next";
import { useThreadCreation } from "../../generated";
import { Created } from "../../page-components/thread/creation/created";
import { Creating } from "../../page-components/thread/creation/creating";
import { Error } from "../../page-components/thread/creation/error";
import { Initial } from "../../page-components/thread/creation/initial";
import { NotCreated } from "../../page-components/thread/creation/not-created";

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
