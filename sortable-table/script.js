"use strict";

/*   
   Global Variables:
   tableData
      An 2-dimensional array of the data found in the body of the web table
      
   dataCategories
      An array of the column titles found the head of the web table
      
   sortIndex
      The index number of the column by which the web table should be
      sorted where 0 = 1st column, 1 = 2nd column, etc.
      
   sortDirection
      A value indicating direction of the sorting where a value of 1 sorts 
      the data in ascending order and a value of -1 sorts the data in descending order
    
   
   
   Functions List:   
   defineDataArray()
      Extracts values from the body of the web table and stores them in the
      tableData array
      
   writeTableData()
      Writes the sorted data into the table rows and cells       
      
   defineColumns()
      Extracts values form the column heads of the web table and stores 
      them in the dataCategories array; also sets up the onclick event
      handlers for the column heads so that the table can be sorted by
      clicking a table heading cell.
           
   columnSort(e)
      Event handler function that sorts the table data when a column
      heading is clicked  
   
   dataSort2D(a, b)
      Compare function used to sort numeric and alphabetical data from
      a 2-dimensional array 
*/

// define global variables
import { mocky } from './mock-data.js';
let tableData = []
var dataCategories = [];
var sortIndex=0, sortDirection=1;
var columnStyles;

// create Event Listener
window.addEventListener("load", function()
  {
    const table = initTable("#container");
    initTableHeaders(table, mocky[0]);
    initTableData(table, mocky);
    
    defineDataArray();
    writeTableData();
    defineColumns();
  }
);

const initTable = (selector) => {
  const containerEl = document.querySelector(selector);
  const tableEl = document.createElement("table");
  tableEl.classList.add("sortable");
  containerEl.appendChild(tableEl);
  return tableEl;
}

const initTableHeaders = (table, row)=>{
  const headerTitles = Object.keys(row);
  const tableHeader = document.createElement("thead");
  const headContainer = document.createElement("tr");
  tableHeader.appendChild(headContainer)
  headerTitles.forEach(title => {
    const el = document.createElement("th");
    el.textContent = title;
    headContainer.appendChild(el);
  })

  table.appendChild(tableHeader);
  return tableHeader;

};

const initTableData =(table, data) =>{
  const columnTitles = Object.keys(data[0]);
  const tableBody = document.createElement("tbody");

  data.forEach((row, rowIndex) => {
    const rowEl = document.createElement("tr");
    columnTitles.forEach(key => {
      const cell = document.createElement("td");
      cell.textContent = row[key];
      rowEl.appendChild(cell);
    })
    tableBody.appendChild(rowEl);
  })
  table.appendChild(tableBody);
}

function defineDataArray() 
{
  var tableRows = document.querySelectorAll("table.sortable tbody tr");

  for(var i = 0; i<tableRows.length; i++)
  {
    var rowCells = tableRows[i].children;
    var rowValues = new Array(rowCells.length);
    for(var j = 0; j<rowCells.length; j++)
    {
        rowValues[j] = rowCells[j].textContent;
    }
    tableData[i] = rowValues;
  }
//  tableData.sort(dataSort2D);

writeTableData();
}

function writeTableData() 
{
  var newTableBody = document.createElement("tbody");
  for(var i=0; i<tableData.length; i++)
  {
    var tableRow = document.createElement("tr");
    
    for(var j=0; j<tableData[i].length; j++)
    {
      var tableCell = document.createElement("td");
      tableCell.textContent = tableData[i][j];
      tableRow.appendChild(tableCell);
    }
    newTableBody.appendChild(tableRow);
  }
  var sortTable = document.querySelector("table.sortable");
  var oldTableBody = sortTable.lastElementChild;
  sortTable.replaceChild(newTableBody, oldTableBody);
}

function defineColumns() 
{
  var newSheet  = document.createElement("style");
  document.head.appendChild(newSheet);
columnStyles = document.styleSheets[document.styleSheets.length -1];
  columnStyles.insertRule(
    `table.sortable thead tr th{
      cursor: pointer;
    }`
  , 0);
  columnStyles.insertRule(
    `table.sortable thead tr th::after{
      content: '\\00a0';
      font-family: monospace;
      margin-left: 5px;
    }`
  , columnStyles.cssRules.length);  
  var columnHeaders = document.querySelectorAll("table.sortable thead tr th");
  for(var i = 0; i<columnHeaders.length; i++)
  {
    dataCategories[i] = columnHeaders[i].textContent;
    columnHeaders[i].onclick = columnSort;
  }
} // end defineColumns function

function columnSort(e) 
{
  var columnText = e.target.textContent;
  var columnIndex = dataCategories.indexOf(columnText);

  if(columnIndex === sortIndex)
  {
    sortDirection = -sortDirection; // switch direction
  }  
  else {
    sortIndex = columnIndex // else, assign sort to column index
  }

  var columnNumber = columnIndex + 1;


  columnStyles.deleteRule( columnStyles.cssRules.length-1);

  if(sortDirection === 1)
  {
    columnStyles.insertRule(
      `table.sortable thead tr th:nth-of-type(${columnNumber})::after{
      content: '\\25b2';
      }`, columnStyles.cssRules.length);
  }
  else
  {
      columnStyles.insertRule(
        `table.sortable thead tr th:nth-of-type(${columnNumber})::after {
        content: '\\25bc';
        }`, columnStyles.cssRules.length);
  }

  // and finally, actually sort the durn thing.
  tableData = sortByColumn(tableData, sortIndex, sortDirection);
//   tableData.sort(dataSort2D);
  writeTableData();



} // end columnSort function

/*****
 * This will take the table's column index, and sort direction,
 *   determine what type of data from the first cell in that column
 *   and implement the appropriate sorting function from that. The
 *   three sort function options at this point are:
 * 
 * - sortByDate
 * - sortByNumber
 * - sortByString
 *****/

const sortByColumn = (data, index, direction) =>{
  let sortFunc;
  if(data[0][sortIndex].match(/^(0[1-9]|1[012]|[1-9])[- /.]([1-9]|0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d$/) ) {
    sortFunc = sortByDate;
  } else if(Number(data[0][sortIndex]) == data[0][sortIndex]){
    sortFunc = sortByNumber;
  } else {
    sortFunc = sortByString;
  }
  console.log(data[0][sortIndex], sortFunc);

  return data.sort(sortFunc);
}


const sortByDate = (a, b) => (new Date(a[sortIndex])-new Date(b[sortIndex]))*sortDirection;

const sortByNumber = (a, b) => (a[sortIndex]-b[sortIndex])*sortDirection;

const sortByString = (a, b) => a[sortIndex].localeCompare(b[sortIndex])*sortDirection;