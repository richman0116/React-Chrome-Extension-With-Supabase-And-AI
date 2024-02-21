import Main from "./Pages";
import { AuthContextProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthContextProvider>
      <Main />
    </AuthContextProvider>
  )
};

export default App;
