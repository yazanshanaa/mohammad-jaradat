import { render, screen } from "@testing-library/react"
import { Button } from "./button"
test("يظهر زر في الصفحة", () => {
    render(<Button>اضغط هنا</Button>)
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
})