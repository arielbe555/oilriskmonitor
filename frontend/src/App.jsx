import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import '@/i18n'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Alerts } from '@/pages/Alerts'
import { Tickets } from '@/pages/Tickets'
import { TicketDetail } from '@/pages/TicketDetail'
import { Assets } from '@/pages/Assets'
import { Reports } from '@/pages/Reports'
import { Settings } from '@/pages/Settings'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="assets" element={<Assets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
