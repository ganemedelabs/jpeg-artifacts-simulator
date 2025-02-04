export default function TitleBar({ title }: { title: string }) {
    return (
        <div className="title-bar">
            <h2 className="title-bar-text text-sm font-light">{title}</h2>
            <div className="title-bar-controls">
                {/* Decorative buttons */}
                <button type="button" aria-label="Minimize" tabIndex={-1} />
                <button type="button" aria-label="Maximize" tabIndex={-1} />
                <button type="button" aria-label="Close" tabIndex={-1} />
            </div>
        </div>
    );
}
