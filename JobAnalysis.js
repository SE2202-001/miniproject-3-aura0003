document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const levelFilter = document.getElementById('level-filter');
    const typeFilter = document.getElementById('type-filter');
    const skillFilter = document.getElementById('skill-filter');
    const sortOptions = document.getElementById('sort-options');
    const jobList = document.getElementById('job-list');
  
    let jobs = []; // Holds all jobs
  
    class Job {
      constructor(jobData) {
        try {
          this.title = jobData.Title || "No Title Provided";
          this.postedTime = jobData.Posted || "Unknown Time";
          this.type = jobData.Type || "Unknown Type";
          this.level = jobData.Level || "Unknown Level";
          this.skill = jobData.Skill || "Unknown Skill";
          this.detail = jobData.Detail || "No Details Available";
        } catch (error) {
          console.error("Error processing job data:", error);
          this.title = "Invalid Job Data";
          this.postedTime = "Unknown Time";
          this.type = "Unknown Type";
          this.level = "Unknown Level";
          this.skill = "Unknown Skill";
          this.detail = "No Details Available";
        }
      }
  
      getFormattedPostedTime() {
        return this.postedTime;
      }
  
      getDetails() {
        return `
          <h3>${this.title}</h3>
          <p><strong>Posted Time:</strong> ${this.getFormattedPostedTime()}</p>
          <p><strong>Type:</strong> ${this.type}</p>
          <p><strong>Level:</strong> ${this.level}</p>
          <p><strong>Skill:</strong> ${this.skill}</p>
          <p><strong>Details:</strong> ${this.detail}</p>
        `;
      }
    }
  
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        displayError("No file selected. Please upload a valid JSON file.");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!Array.isArray(data)) {
            throw new Error("Invalid JSON format. Expected an array of jobs.");
          }
  
          jobs = data.map(job => new Job(job));
          if (jobs.length === 0) {
            displayError("The uploaded JSON file contains no jobs.");
            return;
          }
  
          populateFilters();
          displayJobs(); // Immediately display jobs
        } catch (error) {
          displayError("Failed to process the JSON file. Ensure it contains valid job data.");
          console.error(error);
        }
      };
  
      reader.onerror = () => {
        displayError("Error reading the file. Please try again.");
      };
  
      reader.readAsText(file);
    });
  
    function populateFilters() {
      const levels = [...new Set(jobs.map(job => job.level))];
      const types = [...new Set(jobs.map(job => job.type))];
      const skills = [...new Set(jobs.map(job => job.skill))];
  
      populateFilter(levelFilter, levels);
      populateFilter(typeFilter, types);
      populateFilter(skillFilter, skills);
    }
  
    function populateFilter(select, options) {
      select.innerHTML = '<option value="All">All</option>';
      options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
      });
    }
  
    function displayJobs() {
      jobList.innerHTML = '';
      const filteredJobs = filterJobs();
      const sortedJobs = sortJobs(filteredJobs);
  
      if (sortedJobs.length === 0) {
        jobList.innerHTML = '<p>No jobs match the selected criteria.</p>';
        return;
      }
  
      sortedJobs.forEach(job => {
        const jobItem = document.createElement('div');
        jobItem.classList.add('job-item');
        jobItem.textContent = job.title;
        jobItem.addEventListener('click', () => {
          displayJobDetails(job);
        });
        jobList.appendChild(jobItem);
      });
    }
  
    function filterJobs() {
      return jobs.filter(job => {
        return (
          (levelFilter.value === 'All' || job.level === levelFilter.value) &&
          (typeFilter.value === 'All' || job.type === typeFilter.value) &&
          (skillFilter.value === 'All' || job.skill === skillFilter.value)
        );
      });
    }
  
    function sortJobs(jobs) {
      const sortBy = sortOptions.value;
      if (sortBy === 'title-az') {
        return jobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'title-za') {
        return jobs.sort((a, b) => b.title.localeCompare(a.title));
      } else if (sortBy === 'time-newest') {
        return jobs.sort((a, b) => {
          const timeA = parseRelativeTime(a.postedTime);
          const timeB = parseRelativeTime(b.postedTime);
          return timeB - timeA; // Newest first
        });
      } else if (sortBy === 'time-oldest') {
        return jobs.sort((a, b) => {
          const timeA = parseRelativeTime(a.postedTime);
          const timeB = parseRelativeTime(b.postedTime);
          return timeA - timeB; // Oldest first
        });
      }
      return jobs;
    }
  
    function parseRelativeTime(timeString) {
      const now = new Date();
      if (timeString.includes("minute")) {
        const minutes = parseInt(timeString.split(" ")[0]);
        return new Date(now.getTime() - minutes * 60000);
      } else if (timeString.includes("hour")) {
        const hours = parseInt(timeString.split(" ")[0]);
        return new Date(now.getTime() - hours * 3600000);
      } else if (timeString.includes("day")) {
        const days = parseInt(timeString.split(" ")[0]);
        return new Date(now.getTime() - days * 86400000);
      }
      return now;
    }
  
    function displayJobDetails(job) {
      const detailsDiv = document.createElement('div');
      detailsDiv.innerHTML = job.getDetails();
      detailsDiv.classList.add('job-details');
      jobList.innerHTML = ''; // Clear job list and show details
      jobList.appendChild(detailsDiv);
  
      const backButton = document.createElement('button');
      backButton.textContent = 'Back to Job List';
      backButton.addEventListener('click', () => {
        displayJobs();
      });
      jobList.appendChild(backButton);
    }
  
    function displayError(message) {
      jobList.innerHTML = `<div class="error">${message}</div>`;
    }
  
    levelFilter.addEventListener('change', displayJobs);
    typeFilter.addEventListener('change', displayJobs);
    skillFilter.addEventListener('change', displayJobs);
    sortOptions.addEventListener('change', displayJobs);
  });
  