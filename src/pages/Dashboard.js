import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams , Link} from 'react-router-dom';
import Layout from "../components/Layout";
import url from './url';


function Dashboard() {
  
  return (
    <Layout>
      <div className="container-fluid">
    <div className="row">

    <div className="col-12">
    <h5>Dashboard</h5>
    </div>
</div>

      </div>
      </Layout>
  );
}

export default Dashboard;
