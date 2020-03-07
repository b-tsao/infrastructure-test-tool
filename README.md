# Tech Notes

While the application supports HTTP REST Requests for retrieving or modifying projects,
real-time data retrieval is also available through SSE (Server Sent Events) and Websockets.

**REST**  
GET           /heartbeat  
GET           /projects  
GET           /project  
POST        /project  
DELETE   /project<sup>1</sup>  
PUT           /project/file  
DELETE   /project/file  

**Server Sent Events**  
GET           /event/projects  
GET           /event/project  
  
**Websockets**  
TODO Will be used for individual file editing for real time collaboration  
  
<sup>1</sup>The DELETE project operation deactivates the project. Currently deactivated projects are permanently deleted upon server start.
  
The file system structure for storing projects looks as follows (relative to **app** directory):

- **public/projects/<uuid><sup>1</sup>**

  - **metadata.json**
  - **files (directory)**

<sup>1</sup> Project directories are UUIDs by design in order to allow projects to be 'deactivated' instead of 'deleted' by the user.
A deactivated project is essentially deleted to the user and is removed from memory.<sup>2</sup>

<sup>2</sup> Projects are loaded into memory upon server start as JSON with key/value pair of <project_name>/<project_metadata>.

The **metadata.json** structure is as follow:  
{  
    "name": <String> Project name,  
    "description": <String> Project description,  
    "active": <Boolean> Project active status,  
    "status": <Integer> enum{ 0 (NORMAL), 1 (ERROR) },  
    "errors": <Integer> Number of errors in the project,  
    "files": [<File>] Files in the project  
}

> <em>Note</em>: Each project contains all the fields above in-memory, in addition to the following fields added upon load:
>
> - "path": <String> "Project path relative to app directory"
> - "createdTime" <Date> Created time retrieved from **metadata.json** file stat created time
> - "modifiedTime" <Date> Modified time retrieved from **metadata.json** file stat modified time
  
The **<File>** structure is as follow:  
{  
    "name": <String> File name,  
    "path": <String> File path relative to project path **files** directory<sup>1</sup>,  
    (file) "description": <String> File description,  
    (directory) "files": [<File>] Files in the directory  
}  
  
<sup>1</sup> Directory path always ends with a '/'. 
  The file path in the file structure is constructed using '/' separators, 
  which can be different from the OS file system separator. The model 'projectmanager'
  takes care of this by deconstructing (splitting) the file path and using the path library
  to reconstruct the absolute file path when using it.