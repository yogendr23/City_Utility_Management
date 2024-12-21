**City Utility Microservice Project**

**Overview**

This project is a multi-service web application designed to manage city utilities efficiently. It leverages microservices architecture to handle various functionalities, including:

* **User Management:** Handles user registration, login, and role-based access control.
* **Location Tracking:** Uses geolocation to determine user location and pinpoint issue locations.
* **Announcement Posting:** Allows administrators to post and manage public announcements.
* **Email Notifications:** Sends automated email notifications for various events, such as report assignments and updates.
* **Utility Reporting:** Enables users to report utility issues and track their resolution status.

**Project Structure**

```
├── LICENSE
├── README.md
├── admin/
├── email-service/
├── frontend/
├── location-service/
├── public-info-service/
├── user-service/
├── utility-reporting-service/
```

**Frontend**

* **Citizen:**
    * Registration
    * Login
    * Home:
        * Report an Issue
        * View Reported Issues
        * Check Announcements
* **Admin:**
    * Add/Delete Employees
    * Manage Reports
    * Create/Edit/Delete Announcements
    * View Archived Reports

    
   > **Note** Admin only can be added via running 'node addAdmin.js' command from frontend folder. You can add multiple admins, but need to change in addAdmin.js file.


* **Employee:**
    * View Assigned Reports
    * Update Report Status
    * View Announcements


    > **Note** Can be only added by admin.


* **Profile Update:** All users can update their profile information.
* **Account Deletion:** Only citizens can delete their accounts.

**Backend Services**

* **User Service:** Handles user registration, login, and role-based access control.
* **Location Service:** Uses geolocation to determine user location and address.
* **Public Info Service:** Manages public announcements.
* **Utility Reporting Service:** Manages utility reports and their status.
* **Email Service:** Sends email notifications for various events.
* **History Service:** Archives resolved reports for historical reference.

**Installation and Setup**

1. **Clone the Repository:**
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   ```
2. **Environment Configuration:**
   - Configure environment variables in `.env` files for each service.
   
   Frontend .env requires:
   ```bash
    REACT_APP_API_URL=http://localhost:5000/api/users
   ```

   User, admin,public-info,utility-reporting,history  service .env requires:
   ```bash
    MONGO_URI="Your mongo db connector api"
    JWT_SECRET="your_jwt_secret"
   ```

    Email service .env requires:
   ```bash
    PORT=5005
    MAILJET_API_KEY="your key"
    MAILJET_API_SECRET="your key"
   ```

   Location .env requires:
   ```bash
    OPENCAGE_API_KEY="your opencage api key"
   ```

3. **Install Dependencies:**
   ```bash
   cd <service-directory>
   npm install
   ```
4. **Build and Run Docker Images:**
   Build and run Docker images for each service:
   ```bash
   docker build -t <service-name> .
   docker run -d -p <port>:<port> --name <service-name> <service-name>
   ```

   Frontend:
   ```bash
    docker build -t frontend .
    docker run -d -p 3000:3000 --name frontend frontend
   ```

    User service:
    ```bash
    docker build -t user-service .
    docker run -d -p 5000:5000 --name user-service user-service
   ```

   Email service:
   ```bash
    docker build -t email-service .
    docker run -d -p 5005:5005 --name email-service-container email-service
   ```

   Location service:
   ```bash
    docker build -t location-service .
    docker run -d -p 5002:5002 --name location-service location-service
   ```

   Public-Info service:
   ```bash
    docker build -t public-info-service .
    docker run -d -p 5004:5004 --name public-info-service-container public-info-service
   ```

    Utility-reporting service:
   ```bash
    docker build -t utility-reporting-service .
    docker run -d -p 5001:5001 --name utility-reporting-service utility-reporting-service
   ```

   History  service:
   ```bash
    docker build -t history-service .
    docker run -d -p 5006:5006 --name history-service-container history-service
   ```

   (If you want to change port for the specific microservice change it in the docker file of that microservice and also in the api.js and .env file of the frontend)

**Usage**

Once all services are running, access the frontend application at:
```
http://localhost:3000/
```

**Additional Notes**

* **Security:** Passwords are stored in encrypted form.
* **Error Handling:** Implement robust error handling and logging mechanisms.
* **Testing:** Write unit and integration tests to ensure code quality and reliability.
* **Deployment:** Consider using container orchestration tools like Kubernetes for deployment and scaling.

By following these steps, you can deploy and run the City Utility microservice project.

Happy coding!!
