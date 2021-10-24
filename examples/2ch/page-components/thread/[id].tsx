import { ThreadData } from "../../generated";
import { PageComponents } from "../../masmott/isr";

export const components: PageComponents<ThreadData> = {
  Error: () => <div>Error</div>,
  Fetching: () => <div>Fetching</div>,
  LoadedExists: () => <div>LoadedExists</div>,
  LoadedNotExists: () => <div>LoadedNotExists</div>,
  RouterLoading: () => <div>RouterLoading</div>,
};
