import { ThreadData } from "../../generated";
import { LoadedExistsComponent } from "../../masmott/doc";
import { PageComponents } from "../../masmott/isr";

const LoadedExists: LoadedExistsComponent<ThreadData> = ({ id }) => {
  return <div>Thead Id :{id}</div>;
};

export const components: PageComponents<ThreadData> = {
  Error: () => <div>Error</div>,
  Fetching: () => <div>Fetching</div>,
  LoadedExists,
  LoadedNotExists: () => <div>LoadedNotExists</div>,
  RouterLoading: () => <div>RouterLoading</div>,
};
