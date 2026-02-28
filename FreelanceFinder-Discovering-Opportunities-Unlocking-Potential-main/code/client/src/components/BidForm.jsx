import React, { useState } from "react";
import axios from "axios";

function BidForm({ params }) {
  const [budget, setBudget] = useState("");
  const [time, setTime] = useState("");
  const [proposal, setProposal] = useState("");

  const submitBid = async () => {
    try {
       await axios.post("http://localhost:5000/api/bids", {
        projectId: params.id,
        budget,
        time,
        proposal
      });

      alert("Bid submitted successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Bidding failed!! Try again!");
    }
  };

  return (
    <div>
      <input placeholder="Budget" onChange={(e)=>setBudget(e.target.value)} />
      <input placeholder="Time" onChange={(e)=>setTime(e.target.value)} />
      <textarea placeholder="Proposal" onChange={(e)=>setProposal(e.target.value)} />

      <button onClick={submitBid}>Submit Bid</button>
    </div>
  );
}

export default BidForm;
