import { motion } from 'framer-motion';
import { memo } from 'react';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { genericMemo } from '~/utils/react';
export const Slider = genericMemo(({ selected, options, setSelected }) => {
    const isLeftSelected = selected === options.left.value;
    return (<div className="flex items-center flex-wrap shrink-0 gap-1 bg-bolt-elements-background-depth-1 overflow-hidden rounded-full p-1">
      <SliderButton selected={isLeftSelected} setSelected={() => setSelected?.(options.left.value)}>
        {options.left.text}
      </SliderButton>
      <SliderButton selected={!isLeftSelected} setSelected={() => setSelected?.(options.right.value)}>
        {options.right.text}
      </SliderButton>
    </div>);
});
const SliderButton = memo(({ selected, children, setSelected }) => {
    return (<button onClick={setSelected} className={classNames('bg-transparent text-sm px-2.5 py-0.5 rounded-full relative', selected
            ? 'text-bolt-elements-item-contentAccent'
            : 'text-bolt-elements-item-contentDefault hover:text-bolt-elements-item-contentActive')}>
      <span className="relative z-10">{children}</span>
      {selected && (<motion.span layoutId="pill-tab" transition={{ duration: 0.2, ease: cubicEasingFn }} className="absolute inset-0 z-0 bg-bolt-elements-item-backgroundAccent rounded-full"></motion.span>)}
    </button>);
});
