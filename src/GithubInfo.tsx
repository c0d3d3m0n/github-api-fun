import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { ColDef } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community';

interface Repository {
  id: number;
  name: string;
  html_url: string;
}

export default function GithubInfo() {
  const [keyword, setKeyword] = useState('');
  const [repodata, setRepodata] = useState<Repository[]>([]);
  const [gridApi, setGridApi] = useState(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const onGridReady = (params) => {
    setGridApi(params.api);
    if (params.api) {
      params.api.sizeColumnsToFit();
    }
  };

  useEffect(() => {
    const resizeListener = () => {
      if (gridApi !== null) {
        gridApi.sizeColumnsToFit();
      }
    };
    window.addEventListener('resize', resizeListener);
    return () => window.removeEventListener('resize', resizeListener);
  }, [gridApi]);

  useEffect(() => {
    // Function to calculate and update the header height
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight((headerRef.current as HTMLElement).offsetHeight);
      }
    };

    // Calculate the initial height
    updateHeaderHeight();

    // Add event listener for window resize
    window.addEventListener('resize', updateHeaderHeight);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const htmlUrlCellRenderer = (params: ICellRendererParams) => {
    return (
      <a className='text-blue-600' href={params.value} target='_blank'>
        {params.value}
      </a>
    );
  };

  const [columnDefs] = useState<ColDef[]>([
    { field: 'id', sortable: true, filter: true },
    { field: 'name', sortable: true, filter: true },
    {
      field: 'html_url',
      cellRenderer: htmlUrlCellRenderer,
      sortable: true,
      filter: true,
    },
  ]);

  const handleClick = () => {
    axios
      .get<{ items: Repository[] }>(
        `https://api.github.com/search/repositories?q=${keyword}`,
      )
      .then((res) => setRepodata(res.data.items))
      .catch((err) => console.error(err));
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='w-full max-w-md'>
        <input
          name='keyword'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className='border-2 border-gray-300 rounded p-2 mb-4 w-full'
        />
        <div className='flex justify-center'>
          <button
            name='fetch'
            onClick={handleClick}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Git it!
          </button>
        </div>
      </div>
      <div className='w-full mt-4 overflow-auto'>
        {repodata.length === 0 ? (
          <div className='flex justify-center'>
            <p className='text-white'>No data</p>
          </div>
        ) : (
          <div
            className='ag-theme-material-dark mx-auto'
            style={{
              height: `calc(100vh - ${headerHeight}px)`,
              width: '100vw',
            }}
          >
            <AgGridReact
              rowData={repodata}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={10}
            />
          </div>
        )}
      </div>
    </div>
  );
}
