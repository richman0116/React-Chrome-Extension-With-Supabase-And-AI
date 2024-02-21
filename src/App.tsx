import Main from "./Pages";
import { AuthContextProvider } from "./context/AuthContext";
import { CircleContextProvider } from "./context/CircleContext";

const App = () => {
  return (
    <AuthContextProvider>
      <CircleContextProvider>
        <Main />
      </CircleContextProvider>
    </AuthContextProvider>
  );
};

export default App;
