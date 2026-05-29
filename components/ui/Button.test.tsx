import { render, screen } from "@testing-library/react"
import { Button } from "./button"
test("يظهر زر في الصفحة", () => {
    render(<Button />)

    const button = screen.getByRole("button")

    expect(button).toBeInTheDocument()
})