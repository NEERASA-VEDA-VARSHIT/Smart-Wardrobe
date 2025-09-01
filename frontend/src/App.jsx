import { useState } from "react";
import UploadForm from "./components/UploadForm";
import Gallery from "./components/Gallery";
import "./index.css";

function App() {
  const [wardrobe, setWardrobe] = useState([]);

  const addItem = (item) => {
    setWardrobe((prev) => [...prev, item]);
  };

  const toggleWorn = (id) => {
    setWardrobe(prevWardrobe => 
      prevWardrobe.map(item => 
        item.id === id 
          ? { 
              ...item, 
              worn: !item.worn, 
              lastWorn: !item.worn ? Date.now() : null 
            }
          : item
      )
    );
  };

  const toggleWash = (id) => {
    setWardrobe(prevWardrobe => 
      prevWardrobe.map(item => 
        item.id === id 
          ? { ...item, washed: !item.washed }
          : item
      )
    );
  };

  return (
    <div>
      <h1>Smart Wardrobe</h1>
      <UploadForm onAddItem={addItem} />
      
      <Gallery 
        wardrobe={wardrobe} 
        onToggleWorn={toggleWorn}
        onToggleWash={toggleWash}
      />

    </div>
  );
}

export default App;
