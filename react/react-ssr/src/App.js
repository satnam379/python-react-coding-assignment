import dice from './dice.png';
import './App.css';
import SSRPage from './components/SSR';

function App() {
 const data ={
    title:"logo",
    url: dice
  }
  return (
    <div className="App">
      <SSRPage serverData={data} />
    </div>
  );
}

export default App;
