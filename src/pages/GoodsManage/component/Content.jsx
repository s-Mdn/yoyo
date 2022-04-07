import React from 'react';
import { Empty } from 'antd';

const Content = (props) => {
  const { content, childrenNode, handleDelete, handleEdit, isView, handleView } = props;
  return (
    <div
      className={['good_list_wrap_h_full', content.length && '-ml-12'].join(
        ' '
      )}
    >
      {content.length > 0 ? (
        <div className='flex flex-wrap'>
          {content.map((e) => {
            return (
              <div
                key={e.id}
                className='flex flex-col goods_item w_100 ml-12 mb-12 cursor-pointer rounded'
              >
                {/* 图片或者视频 */}
                <div className='relative goods_item__hover w_100 h_100 overflow-hidden border box-border rounded'>
                  {childrenNode(e)}

                  {/* 删除 和 编辑 */}
                  <div className='absolute hidden justify-between font_12 w-full bottom-0 text-white bg-FF8462 opacity-60 edit'>
                    <span
                      className='text-center flex-1 h-full'
                      onClick={() => handleEdit(e)}
                    >
                      编辑
                    </span>
                    <span
                      className='text-center flex-1 h-full'
                      onClick={() => handleDelete(e)}
                    >
                      删除
                    </span>
                    {isView && (
                      <span
                        className='text-center flex-1 h-full'
                        onClick={() => handleView(e)}
                      >
                        查看
                      </span>
                    )}
                  </div>
                </div>

                {/* 名称 */}
                <div className='font_12 mt-3 px-1'>
                  <div className='text-overflow text-center'>{e.name}</div>
                </div>
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
