const downloadData = (fileName: string, headers: string[], data: any[] ) => {
    const csvRows = [
        headers.join(','),
        ...data.map(dataItem =>
            Object.values(dataItem).join(',')
        )
    ];

    // Create and download the file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default downloadData