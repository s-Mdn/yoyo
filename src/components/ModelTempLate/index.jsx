import React from 'react';
import { Modal } from 'antd';
import './index.less';
const ModelTempLate = (props) => {
  const { title, visible, closable, footer, content, bodystyle } = props;
  const bodyStyle = { padding: '10px 20px', fontSize: '12px' };

  return (
    <>
      <Modal
        bodyStyle={bodystyle || bodyStyle}
        title={title}
        visible={visible}
        closable={closable || false}
        footer={footer}
      >
        {content}
      </Modal>
    </>
  );
};

export default ModelTempLate;
