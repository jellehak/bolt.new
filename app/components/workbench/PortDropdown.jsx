import { memo, useEffect, useRef } from 'react';
import { IconButton } from '~/components/ui/IconButton';
export const PortDropdown = memo(({ activePreviewIndex, setActivePreviewIndex, isDropdownOpen, setIsDropdownOpen, setHasSelectedPreview, previews, }) => {
    const dropdownRef = useRef(null);
    // sort previews, preserving original index
    const sortedPreviews = previews
        .map((previewInfo, index) => ({ ...previewInfo, index }))
        .sort((a, b) => a.port - b.port);
    // close dropdown if user clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            window.addEventListener('mousedown', handleClickOutside);
        }
        else {
            window.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);
    return (<div className="relative z-port-dropdown" ref={dropdownRef}>
        <IconButton icon="i-ph:plug" onClick={() => setIsDropdownOpen(!isDropdownOpen)}/>
        {isDropdownOpen && (<div className="absolute right-0 mt-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded shadow-sm min-w-[140px] dropdown-animation">
            <div className="px-4 py-2 border-b border-bolt-elements-borderColor text-sm font-semibold text-bolt-elements-textPrimary">
              Ports
            </div>
            {sortedPreviews.map((preview) => (<div key={preview.port} className="flex items-center px-4 py-2 cursor-pointer hover:bg-bolt-elements-item-backgroundActive" onClick={() => {
                    setActivePreviewIndex(preview.index);
                    setIsDropdownOpen(false);
                    setHasSelectedPreview(true);
                }}>
                <span className={activePreviewIndex === preview.index
                    ? 'text-bolt-elements-item-contentAccent'
                    : 'text-bolt-elements-item-contentDefault group-hover:text-bolt-elements-item-contentActive'}>
                  {preview.port}
                </span>
              </div>))}
          </div>)}
      </div>);
});
