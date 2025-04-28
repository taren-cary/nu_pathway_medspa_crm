# Nu Pathway MedSpa Voice AI CRM PRD

## Tech Stack
- **Backend/Webhook**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **Frontend**: React + Tailwind
- **Hosting**: Supabase (backend) + Vercel or Netlify (frontend)

The app must be able to be tested using npm run dev.


## Database Schema

### 1. Table: `customers`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary Key |
| name | Text | Full name of customer |
| phone | Text | Phone Number |
| email | Text | Email Address |
| created_at | Timestamp | First time they booked |

### 2. Table: `appointments`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary Key |
| customer_id | UUID | Foreign Key→ customers.id |
| appointment_time | Timestamp | Scheduled time |
| service | Text | Service requested |
| notes | Text | Notes from Retell AI |
| status | Text | Booked, Completed, Cancelled |
| created_at | Timestamp | When the appointment was created |

## Supabase Functions

Create a Supabase Edge Function called `retell-webhook` to:
- Receive JSON payload from Retell AI.
- Check if Customer exists based on phone/email.
- If not, create new Customer.
- Then, insert Appointment linked to that Customer.

Create logic that maps the following incoming webhook variables to their proper places for each customer in the supabase database:
- `name` → Customer Name
- `phoneNumber` → Customer Phone
- `email` → Customer Email
- `dateTime` → Appointment Time
- `service` → Service
- `notes` → Any captured notes

Deploy the function and give me the webhook URL so that I can put it in Retell AI.

## CRM Frontend Pages

### 1. 📆 Appointments Page

Create an "Appointments" page displays appointments in a creative, modern and intuitive way, pulling from the appointments data in the Supabase database.

**Toggle Views:**
- View Today's Appointments
- View This Week's Appointments
- View This Month's Appointments

**Action:**
- "Mark as Completed" button next to each appointment

**Modern UI:**
- Calendar icons, colored status tags (Booked → Blue, Completed → Green, Canceled → Red)
- Responsive Design
- Auto-Refresh every 30 seconds

### 2. 👤 Customers Page

Create an "Customers" page displays each customer's information in a creative, modern and intuitive way, pulling from the appointments data in the Supabase database.

**Table View:**
- Columns: Customer Name, Phone Number, Email, First Booking Date

**Link:**
- Click customer to see their Appointment History.

The entire app including the design, needs to be geared towards a modern, sleek, and vibrant medspa named "Nu Pathway Medspa".
