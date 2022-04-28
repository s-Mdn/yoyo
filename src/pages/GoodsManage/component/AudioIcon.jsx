import React, { useState, useEffect } from 'react';

const AudioIcon = (props) => {
  const[tag, setTag] = useState('.');
  const { Icon, color } = props;

  useEffect(()=>{
    const timer = setTimeout(()=> {
      if( tag.length<3 ){
        const _tag = tag + '.'
        setTag(_tag)
      }
      if( tag.length === 3 ){
        const _tag ='.'
        setTag(_tag)
      }
    }, 1000)
    return ()=>clearTimeout(timer)
  });
  return (
    <div className='flex items-center'>
      <Icon twoToneColor={color} />
      <span>{tag}</span>
    </div>
  )
}
export default AudioIcon