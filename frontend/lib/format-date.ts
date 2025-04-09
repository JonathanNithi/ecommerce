export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return '';
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };