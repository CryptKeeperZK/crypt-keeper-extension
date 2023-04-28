import {useDropzone} from 'react-dropzone';
import "./dropbox.scss";

export const Dropbox = (): JSX.Element => {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({accept: {
    'text/html': ['.json'],
  }});
  
  const files = acceptedFiles.map(file => (
    <li key={file.webkitRelativePath}>
      {file.name} - {file.size} bytes
      {file.name} - {file.type} type
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  );
}
