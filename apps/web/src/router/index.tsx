import { createBrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

const router = createBrowserRouter([
  {
    path: AppRoutes.BASE.key,
    // element: <App/>,
    children: [
      {
        path: AppRoutes.BASE.REPORT.pageA,
        element: <div>Page A</div>,
      },
    ],
  },
])

export { router }
