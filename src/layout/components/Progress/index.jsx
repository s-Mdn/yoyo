import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';

const $Progress = (props) => {
  const _isLoad = localStorage.getItem('isLoad')
  const [progress, setProgress] = useState(0)
  const [isLoad, setIsLoad,] = useState(_isLoad || '1')

  useEffect(()=>{
    if( isLoad !== '0' ) {
      const timer = setTimeout(()=>{
        if (progress !== 100) {
          clearTimeout(timer)
          setProgress((t) => t + 1);
        }
        if( progress === 100 ) {
          localStorage.setItem('isLoad', 0)
          setIsLoad(0)
        }
        return () => clearTimeout(timer)
      }, 1000)
    }
    
  }, [progress, isLoad])

  return (
    <>
      {
        (isLoad === '1')?
          (<div className='absolute top-0 left-0 w-full h-full bg_black_1 flex items-center justify-center' >
            <Progress type='circle' width={80} percent={progress} showInfo strokeColor='#ff8462' />
          </div>) :(null)
      }
    </>
  )
}
export default $Progress