// import { useState } from "react";
// import { createBug } from "../services/bugService";

// function CreateBug() {

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [severity, setSeverity] = useState("");
//   const [reportBy, setReportBy] = useState("");
//   const [assignedDeveloper, setAssignedDeveloper] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await createBug({
//             bugTitle,
//             description,
//             severity,
//             reportBy,
//             assignedDeveloper
//     });

//     alert("Bug Created");
//   };

//   return (
//     <div>

//       <h1>Create Bug</h1>

//       <form onSubmit={handleSubmit}>

//         <input
//           type="text"
//           placeholder="Bug Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         <br /><br />

//         <textarea
//           placeholder="Bug Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         <br /><br />

//         <button type="submit">
//           Submit Bug
//         </button>
        
//         <select value={severity} onChange={(e)=>setSeverity(e.target.value)}>
//                 <option value="">Select Severity</option>
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//                 <option value="critical">Critical</option>
//         </select>

//         <input
//             type="text"
//             placeholder="Reported By (Tester ID)"
//             value={reportBy}
//             onChange={(e)=>setReportBy(e.target.value)}
//             />


//         <input
//             type="text"
//             placeholder="Assigned Developer ID"
//             value={assignedDeveloper}
//             onChange={(e)=>setAssignedDeveloper(e.target.value)}
//             />
//       </form>

//     </div>
//   );
// }

// export default CreateBug;