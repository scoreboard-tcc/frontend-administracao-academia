import { Table } from 'antd';
import Search from 'antd/lib/input/Search';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

function PaginatedTable({
  requestDataSource, pageSize, children, ...otherProps
}) {
  const [page, setPage] = useState(1);
  const [dataSource, setDataSource] = useState({});

  const request = useCallback(async (search) => {
    const response = await requestDataSource({ search, page, perPage: pageSize });

    setDataSource(response);
  }, [page, pageSize, requestDataSource]);

  useEffect(() => {
    request('');
  }, [request]);

  return (
    <>
      <Search onSearch={request} size="large" placeholder="Pesquisar academia" />
      <Table
        loading={!dataSource}
        dataSource={dataSource ? dataSource.data : []}
        pagination={{
          current: page,
          onChange: (x) => setPage(x),
          pageSize,
          total: dataSource ? dataSource.pagination.total : 0,
        }}
        {...otherProps}
      >
        {children}
      </Table>
    </>
  );
}

PaginatedTable.propTypes = {
  requestDataSource: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  children: PropTypes.any.isRequired,
};

PaginatedTable.defaultProps = {
  pageSize: 10,
};

export default PaginatedTable;
