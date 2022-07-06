import { FC, useState } from 'react';

import Files from './Files';
import Image from './Image';

interface ViewMediaProps {
  setIsOpened: (value: boolean) => void;
}

const ViewMedia: FC<ViewMediaProps> = ({ setIsOpened }) => {
  enum Sections {
    images,
    files,
  }
  const [selectedSection, setSelectedSection] = useState(Sections.images);

  return (
    <div
      onClick={() => setIsOpened(false)}
      className={`fixed top-0 left-0 z-20 flex h-full w-full animate-fade-in items-center justify-center bg-[#00000080] transition-all duration-300`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-2 w-full max-w-[500px] rounded-lg bg-dark"
      >
        <div className="flex items-center justify-between border-b border-dark-lighten py-3 px-3">
          <div className="flex-1"></div>
          <div className="flex flex-1 items-center justify-center">
            <h1 className="whitespace-nowrap text-center text-2xl">
              View images and files
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <button
              onClick={() => setIsOpened(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-lighten"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="flex items-stretch border-b border-dark-lighten">
          <button
            onClick={() => setSelectedSection(Sections.images)}
            className={`flex-1 py-2 text-center ${
              selectedSection === Sections.images ? 'bg-dark-lighten' : ''
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setSelectedSection(Sections.files)}
            className={`flex-1 py-2 text-center ${
              selectedSection === Sections.files ? 'bg-dark-lighten' : ''
            }`}
          >
            Files
          </button>
        </div>

        {selectedSection === Sections.images ? (
          <Image />
        ) : selectedSection === Sections.files ? (
          <Files />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ViewMedia;
