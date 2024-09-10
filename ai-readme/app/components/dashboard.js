'use client';

import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

// Demo styles, see 'Styles' section below for some notes on use.
// import 'react-accessible-accordion/dist/fancy-example.css';

// Tab import
import TabModels from './tab-models.js'
import TabLive from "./tab-live_images.js";

import '../styles/dashboard.css';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard() {
  // Control panel
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Consol panel
  const [selectedNavItem, setSelectedNavItem] = useState('Models');

  const renderContent = () => {
    switch (selectedNavItem) {

      case 'Live images':
        return (
          <TabLive
            uploadedImage={uploadedImage}
            prediction={prediction}
          />
        );

      case 'Saved images':
        return (
          <div>Saved Images panel</div>
        );

      default:
        return null;
    }
  };


  // Control Panel submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('prompt', e.target.prompt.value);
    const file = e.target.file.files[0];
    formData.append('file', file);

    // Create a preview URL for the uploaded image
    setUploadedImage(URL.createObjectURL(file));

    const response = await fetch("/api/predictions", {
      method: "POST",
      body: formData,
    });

    let prediction = await response.json(); // response from predictions/route.js
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);
  };

  return (
    <div className="dashboardContainer">
      <div className="controlPanel threeD">
        <h2>Control Panel</h2>
        <Accordion allowZeroExpanded>
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                Create Models
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <TabModels />
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                Styles
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <p>
                In ad velit in ex nostrud dolore cupidatat consectetur
                ea in ut nostrud velit in irure cillum tempor laboris
                sed adipisicing eu esse duis nulla non.
              </p>
            </AccordionItemPanel>
          </AccordionItem>
        </Accordion>
        <form onSubmit={handleSubmit} className="fileUploadForm">

          <label htmlFor="model">Model to use:</label>
          <select name="model" id="modelToUse">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="opel">Opel</option>
            <option value="audi">Audi</option>
          </select>

          <label htmlFor="prompt">Prompt:</label>
          <input type="text" name="prompt" placeholder="enter a prompt to display an image"/>

          <label htmlFor="negPrompt">Negative Prompt: &#40;optional&#41;</label>
          <input type="text" name="negPrompt" placeholder='e.g. "old, broken, dirty, run down"'/>

          <label htmlFor="file">Upload File:</label>
          <input type="file" name="file" accept="image/*"/>

          <button type="submit">Generate</button>
        </form>
      </div>

      {error && <div>{error}</div>}

      <div className="consolePanel">
        <div className="consolePanelNav">
          <ul>
            <li onClick={() => setSelectedNavItem('Live images')}>Live Images</li>
            <li onClick={() => setSelectedNavItem('Saved images')}>Saved Images</li>
          </ul>
        </div>

        <div className="consolePanelContentContainer">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
