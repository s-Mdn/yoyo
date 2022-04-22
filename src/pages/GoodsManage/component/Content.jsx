import React from 'react';
import { Empty } from 'antd';

const Content = (props) => {
  const { content, childVNdom, bol } = props;
 
  return (
    <div
      className={['list_h_full', content.length && '-ml-12'].join(' ')}>
      {content.length > 0 ? (
        <div className='flex flex-wrap pt-4'>
          {content.map((e, i) => {
            return (
              <div
                key={i}
                className='items relative flex flex-col goods_item w_100px h_120px ml-12 mb-12 cursor-pointer rounded'
              >
                {childVNdom(e, bol)}
              </div>
            );
          })}
        </div>
      ) : (
        <div className='mt-20'>
          <Empty />
        </div>
      )}
    </div>
  );
};

export default Content;
